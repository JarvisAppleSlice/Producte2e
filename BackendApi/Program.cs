var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/products", () => "Hello World!");
app.MapPost("/products", () => "Hello World!");

app.Run();
