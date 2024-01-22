from django.urls import path
from .views import GoogleLoginView, Intra42LoginView,  GoogleCallbackView, Intra42CallbackView, VerificationCodeView


urlpatterns = [
    path('google/', GoogleLoginView.as_view(), name="google_login"),
    path('intra42/', Intra42LoginView.as_view(), name="42_login"),

    path('google/callback/', GoogleCallbackView.as_view(), name="google_callback"),
    path('intra42/callback/', Intra42CallbackView.as_view(), name="intra42_callback"),

    path('verification-code', VerificationCodeView.as_view(), name="verification_code")
]
