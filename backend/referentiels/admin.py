from django.contrib import admin
from .models import Culture, Gouvernorat, SaisonAgricole

admin.site.register([Culture, Gouvernorat, SaisonAgricole])
