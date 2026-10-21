from django.urls import path

from . import views

app_name = "donnees"

urlpatterns = [
    path("", views.index, name="index"),
]
