import json
from django.core.exceptions import ValidationError


def get_request_body_value(request, key):
    if request.content_type != 'application/json':
        raise ValidationError('Invalid content type')
    json_data = json.loads(request.body.decode('utf-8'))
    return json_data.get(key, '')
