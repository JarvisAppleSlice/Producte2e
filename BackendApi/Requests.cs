public class PurchaseRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public int UserId { get; set; }
}

public class DeleteRequest
{
    public int UserId { get; set; }
}