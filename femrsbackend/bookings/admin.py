from django.contrib import admin

# Register your models here.
# Register your models here.
from django.contrib import admin
from .models import Booking

admin.site.register(Booking)

from .models import IdGeneration

admin.site.register(IdGeneration)