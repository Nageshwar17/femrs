from django.db import models

# Create your models here.

from django.db import models
from bookings.models import Booking

class Payment(models.Model):
   

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="payment")
    payment_id = models.CharField(max_length=100, unique=True)  # Razorpay payment ID
    order_id = models.CharField(max_length=100, unique=True)  # Razorpay order ID
    status = models.CharField(max_length=20, default='Pending')  # Enum for status
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.payment_id} - {self.status}"

    class Meta:
        ordering = ['-created_at']  # Orders by latest payments
