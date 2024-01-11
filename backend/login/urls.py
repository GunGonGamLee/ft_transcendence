from django.urls import path
from .views import GoogleLoginView, Login42View


urlpatterns = [
    path('google/', GoogleLoginView.as_view(), name="google_login"),
    path('42/', Login42View.as_view(), name="login_42"),
]
