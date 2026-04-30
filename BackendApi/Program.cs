using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

string HashPassword(string password)
{
    using var sha256 = SHA256.Create();
    var bytes = Encoding.UTF8.GetBytes(password);
    var hash = sha256.ComputeHash(bytes);
    return Convert.ToBase64String(hash);
}

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ProductDb>(opt => opt.UseInMemoryDatabase("ProductList"));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {

                          policy.WithOrigins(
                            "http://localhost:5173",
                             "http://127.0.0.1:5173",
                             "http://localhost:3000",
                             "http://127.0.0.1:3000"
                             )
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                      });
});
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ProductDb>();

    if (!db.Products.Any())
    {
        db.Products.AddRange(
            new Product { Id = 1, Name = "Laptop", Price = 999.99m, InventoryCount = 10, UserId = 1 },
            new Product { Id = 2, Name = "Mouse", Price = 25.50m, InventoryCount = 50, UserId = 1 },
            new Product { Id = 3, Name = "Keyboard", Price = 75.00m, InventoryCount = 30, UserId = 2 },
            new Product { Id = 4, Name = "Headphones", Price = 50.25m, InventoryCount = 96, UserId = 2 }
        );
    }

    if (!db.Users.Any())
    {
        db.Users.AddRange(
            new User { Id = 1, Email = "test1@test.com", PasswordHash = HashPassword("password123") },
             new User { Id = 2, Email = "test2@test.com", PasswordHash = HashPassword("password456") }
        );
    }

    db.SaveChanges();
}

app.MapPost("/register", async (ProductDb db, User user) =>
{
    if (string.IsNullOrWhiteSpace(user.Email) ||
        string.IsNullOrWhiteSpace(user.PasswordHash))
    {
        return Results.BadRequest("Email and password are required");
    }

    if (db.Users.Any(u => u.Email == user.Email))
    {
        return Results.BadRequest("Email already exists");
    }

    var plainPassword = user.PasswordHash;
    user.PasswordHash = HashPassword(plainPassword);

    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Ok(new { user.Id, user.Email });
});

app.MapPost("/login", async (ProductDb db, User login) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == login.Email);

    if (user == null)
        return Results.BadRequest("Invalid Email or Password");

    var hashed = HashPassword(login.PasswordHash);

    if (user.PasswordHash != hashed)
        return Results.BadRequest("Invalid Email or Password");

    return Results.Ok(new { user.Id, user.Email });
});

app.MapGet("/products", async (ProductDb db) =>
    await db.Products.ToListAsync());

app.MapPost("/products", async (Product product, ProductDb db) =>
{
    if (product.UserId <= 0)
        return Results.BadRequest("Invalid user");

    db.Products.Add(product);
    await db.SaveChangesAsync();

    return Results.Created($"/products/{product.Id}", product);
});

app.MapPost("/purchase", async (ProductDb db, PurchaseRequest request) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);

    if (user == null)
        return Results.BadRequest("Invalid user");

    if (request.Quantity <= 0)
        return Results.BadRequest("Quantity must be greater than 0");

    if (request.ProductId <= 0)
        return Results.BadRequest("Invalid request");

    var product = await db.Products.FindAsync(request.ProductId);

    if (product == null)
        return Results.BadRequest("Product not found");

    if (product.InventoryCount < request.Quantity)
        return Results.BadRequest("Out of stock");

    product.InventoryCount -= request.Quantity;

    var purchase = new Purchase
    {
        ProductId = product.Id,
        UserId = user.Id,
        Quantity = request.Quantity,
        CreatedAt = DateTime.UtcNow
    };

    db.Purchases.Add(purchase);

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        product.Id,
        product.Name,
        product.Price,
        RemainingInventory = product.InventoryCount,
    });
});

app.MapPut("/products/{id}", async (int id, ProductDb db, Product updated) =>
{
    var product = await db.Products.FindAsync(id);

    if (product == null)
        return Results.NotFound();

    if (updated.UserId <= 0)
        return Results.BadRequest("Not logged in");

    if (product.UserId != updated.UserId)
        return Results.StatusCode(403);

    product.Name = updated.Name;
    product.Price = updated.Price;
    product.InventoryCount = updated.InventoryCount;

    await db.SaveChangesAsync();

    return Results.Ok(product);
});

app.MapDelete("/products/{id}", async (int id, ProductDb db, HttpContext http) =>
{
    var request = await http.Request.ReadFromJsonAsync<DeleteRequest>();

    if (request == null)
        return Results.BadRequest("Invalid request");

    var product = await db.Products.FindAsync(id);

    if (product == null)
        return Results.NotFound();

    if (request.UserId <= 0)
        return Results.BadRequest("Not logged in");

    if (product.UserId != request.UserId)
        return Results.StatusCode(403);


    var purchases = await db.Purchases
     .Where(p => p.ProductId == id)
     .ToListAsync();

    db.Purchases.RemoveRange(purchases);

    db.Products.Remove(product);

    await db.SaveChangesAsync();

    return Results.Ok("Deleted");
});

app.MapGet("/purchases/{userId}", async (int userId, ProductDb db) =>
{
    var purchases = await db.Purchases
        .Where(p => p.UserId == userId)
        .Where(p => db.Products.Any(prod => prod.Id == p.ProductId))
        .Join(
            db.Products,
            purchase => purchase.ProductId,
            product => product.Id,
            (purchase, product) => new
            {
                PurchaseId = purchase.Id,
                ProductName = product.Name,
                Quantity = purchase.Quantity,
                PricePerItem = product.Price,
                Total = product.Price * purchase.Quantity,
                SellerUserId = product.UserId,
                CreatedAt = purchase.CreatedAt
            }
        )
        .ToListAsync();

    return Results.Ok(purchases);
});

app.MapGet("/sales/{userId}", async (int userId, ProductDb db) =>
{
    var sales = await db.Purchases
        .Join(
            db.Products,
            purchase => purchase.ProductId,
            product => product.Id,
            (purchase, product) => new
            {
                Purchase = purchase,
                Product = product
            }
        )
        .Where(x => x.Product.UserId == userId)
        .Join(
            db.Users,
            x => x.Purchase.UserId,
            user => user.Id,
            (x, buyer) => new
            {
                ProductName = x.Product.Name,
                Quantity = x.Purchase.Quantity,
                BuyerEmail = buyer.Email,
                PricePerItem = x.Product.Price,
                Total = x.Product.Price * x.Purchase.Quantity,
                CreatedAt = x.Purchase.CreatedAt
            }
        )
        .ToListAsync();

    return Results.Ok(sales);
});


app.UseCors(MyAllowSpecificOrigins);
app.Run();