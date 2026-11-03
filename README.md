# Presentation

## Artikelöversikt

Öppna sliden **Artikelöversikt** via agendan eller bildnavigeringen och välj en `.xlsx`, `.xls`, `.csv` eller `.tsv`-fil. Importen använder bara kolumnerna `Artikelnummer` och `Aviserat`; kolumnerna `Mottaget` och `Avvikelse` ignoreras. Dubbletter av artikelnummer slås ihop genom att Aviserat summeras. Rader utan artikelnummer men med Aviserat räknas till föregående artikelnummer; rader utan artikelnummer och utan Aviserat hoppas över. Artiklar och summeringar visas inte på skärmen.

Ange Autostore-procenten; Buffert räknas automatiskt som `100 - Autostore`. Knappen skapar och laddar ner `lowwatermark.xlsx` med kolumnerna `artikelnummer`, `aviserad`, `articledef.articlefreetext1` och `plockplats`. `aviserad` är artikelns summerade Aviserat, `articledef.articlefreetext1` är Aviserat multiplicerat med Autostore-procenten och avrundat till närmaste heltal, och `plockplats` är alltid `autostore`.

CSV- och TSV-filer läses direkt i webbläsaren. Excel-import och Excel-export använder SheetJS från dess CDN och kräver därför internetanslutning. Filinnehållet skickas inte till någon server.