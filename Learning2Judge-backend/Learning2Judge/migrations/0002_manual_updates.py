from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Learning2Judge', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='usersession',
            name='details',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userscore',
            name='exercise_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='userscore',
            name='expert_score',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
        migrations.AddField(
            model_name='userscore',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ] 