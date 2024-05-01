# Generated by Django 4.2.11 on 2024-05-01 14:26

from django.db import migrations, models
import django_extensions.db.fields
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Chat",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("message", models.CharField(max_length=5000)),
                ("sender", models.CharField(max_length=100)),
                ("source", models.CharField(max_length=200)),
                ("fileId", models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name="ChatBox",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                (
                    "slug",
                    django_extensions.db.fields.AutoSlugField(
                        blank=True, editable=False, populate_from="name"
                    ),
                ),
                ("chats", models.ManyToManyField(to="taxbot.chat")),
            ],
        ),
        migrations.CreateModel(
            name="Files",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("pdf", models.FileField(upload_to="store/pdfs/")),
            ],
        ),
        migrations.CreateModel(
            name="User",
            fields=[
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("name", models.CharField(max_length=200)),
                (
                    "slug",
                    django_extensions.db.fields.AutoSlugField(
                        blank=True, editable=False, populate_from="name"
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
                ("is_staff", models.BooleanField(default=False)),
                ("chatboxes", models.ManyToManyField(to="taxbot.chatbox")),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
