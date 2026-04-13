using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

public class Product
{
    public int Id { get; set; }
    [Required]
    public string? Name { get; set; }
    [Precision(15, 2), Required]
    public decimal Price { get; set; }
    [Required]

    public int InventoryCount { get; set; }
}