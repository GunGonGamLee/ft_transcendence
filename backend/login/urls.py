from django.urls import path
from .views import GoogleLoginView, FTLoginView


urlpatterns = [
    path('google/', GoogleLoginView.as_view(), name="google_login"),
    path('42/', FTLoginView.as_view(), name="login_42"),
]
