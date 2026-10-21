from django.urls import path

from . import views

app_name = "cartographie"

urlpatterns = [
    path("", views.index, name="index"),
]
