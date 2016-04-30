#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
<<<<<<< HEAD
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
=======
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "lahacks.settings")
>>>>>>> 5d2876150364bcb6767c46a9fd562eda12ba4393

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
