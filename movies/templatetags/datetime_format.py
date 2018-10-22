from django import template

register = template.Library()


@register.simple_tag
def datetime_format(date):
    return date.strftime('%Y/%m/%d %H:%M:%S')
