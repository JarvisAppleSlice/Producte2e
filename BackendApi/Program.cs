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
                            "http://localhost:5173"
                             // "http://127.0.0.1:5173",
                             // "http://localhost:3000",
                             // "http://127.0.0.1:3000"
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
            new Product { Id = 1, Name = "Laptop", Price = 999.99m, InventoryCount = 10 },
            new Product { Id = 2, Name = "Mouse", Price = 25.50m, InventoryCount = 50 },
            new Product { Id = 3, Name = "Keyboard", Price = 75.00m, InventoryCount = 30 }
        );
    }

    if (!db.Users.Any())
    {
        db.Users.Add(new User
        {
            Email = "test@test.com",
            PasswordHash = HashPassword("password123")
        });
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
    db.Products.Add(product);
    await db.SaveChangesAsync();

    return Results.Created($"/products/{product.Id}", product);
});

app.UseCors(MyAllowSpecificOrigins);
app.Run();