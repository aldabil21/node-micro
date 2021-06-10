export enum OrderStatus {
  // When order created - but ticker not reserved
  Created = "created",
  // When ticket is reserved | calcelled by user | reservation time expired
  Cancelled = "cancelled",
  // When ticket successfully reserved
  AwaitPayment = "awaitpayment",
  // Purchased/Paid successfully
  Completed = "completed",
  // Payment failed
  Faild = "faild",
}
