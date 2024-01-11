from drf_yasg import openapi

ft_login_response_schema = {
    302: openapi.Response(
        description="42 인증 후 '/login/authorization'으로 리다이렉트",
        headers={
            "Location": {
                "type": "string",
                "description": "Redirect URI",
                "format": "uri",
            }
        },
        schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "Location": openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Redirect URI",
                    format=openapi.FORMAT_URI,
                    pattern=r"^/login/authorization\?code={code}&" + "state={state}&is_new_user=(true|false)$",
                )
            },
        ),
        examples={
            "application/json": {
                "Location": "/login/authorization?code=1234567890&state=1234567890&is_new_user=true"
            }
        }
    )
}
