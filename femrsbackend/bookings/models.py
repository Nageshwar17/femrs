from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from equipmentlisting.models import Equipment  # Updated model reference
from django.contrib.auth import get_user_model
class Booking(models.Model):
    def get_default_user():
        return get_user_model().objects.first().id  # Adjust this as needed
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name="bookings")
    equipment_owner = models.ForeignKey(User, on_delete=models.CASCADE, default=get_default_user)

    booking_no = models.CharField(max_length=10, unique=True)
    shipping_address = models.TextField()
    pincode = models.CharField(max_length=10)
    rental_start_date = models.DateField()
    rental_end_date = models.DateField()
    amount_payable = models.DecimalField(max_digits=10, decimal_places=2)
    total_days = models.IntegerField()
    created_at = models.DateTimeField(default=timezone.now)

    def calculate_total_cost(self):
        """Returns calculated total cost instead of storing it."""
        return self.total_days * self.equipment.price_per_day

    def save(self, *args, **kwargs):
        """Ensures calculated total cost before saving."""
        self.amount_payable = self.calculate_total_cost()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.booking_no} by {self.user.username}"

# Singleton ID Generation Model
class IdGeneration(models.Model):
    id_string = models.CharField(max_length=10)
    id_num = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        """Ensures only one instance of IdGeneration exists."""
        if not self.pk and IdGeneration.objects.exists():
            raise ValueError("Only one instance of IdGeneration is allowed.")
        super().save(*args, **kwargs)

    def generate_id(self):
        """Generates a new ID by incrementing the stored number."""
        self.id_num += 1
        self.save()
        return f"{self.id_string}{self.id_num}"

    def __str__(self):
        return f"{self.id_string}{self.id_num}"
