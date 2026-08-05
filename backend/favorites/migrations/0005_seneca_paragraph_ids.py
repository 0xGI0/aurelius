from django.db import migrations

# Seneca-Paragraphen-Umbau (2026-08-05): Kapitel-Favoriten s-N werden auf
# den ersten Paragraphen des Kapitels gehoben (s-N-1). Hat ein Nutzer beide
# Formen, wird die alte verworfen (UniqueConstraint user+quote_id).


def forwards(apps, schema_editor):
    Favorite = apps.get_model("favorites", "Favorite")
    for fav in Favorite.objects.filter(quote_id__regex=r"^s-\d{1,2}$"):
        neu = f"{fav.quote_id}-1"
        if Favorite.objects.filter(user=fav.user, quote_id=neu).exists():
            fav.delete()
        else:
            fav.quote_id = neu
            fav.save(update_fields=["quote_id"])


class Migration(migrations.Migration):
    dependencies = [("favorites", "0004_alter_favorite_quote_id")]
    operations = [migrations.RunPython(forwards, migrations.RunPython.noop)]
