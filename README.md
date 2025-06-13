# FINN Vev Components

Dette er en samling av Vev-komponenter for å vise FINN.no-annonser i Vev Design Editor.

## Komponenter

### FINN Annonser
Viser FINN-annonser i en horisontal scroll-liste basert på en FINN søke-URL.

### Finn Slider
En enkel slider-komponent for tallverdier.

## Oppsett for FINN Pro API

For å bruke FINN Pro API (som kreves for full funksjonalitet), må du sette opp en proxy-server siden API-et ikke støtter direkte forespørsler fra nettleseren.

### Deploy til Render

1. Fork eller klon dette repositoriet
2. Opprett en konto på [Render](https://render.com)
3. Opprett en ny Web Service:
   - Connect your GitHub repository
   - Name: `finn-vev-proxy` (eller valgfritt navn)
   - Runtime: Node
   - Build Command: `npm install --production`
   - Start Command: `node server.js`
4. Legg til miljøvariabler (kontakt FINN for API-nøkler):
   - `FINN_CLIENT_ID`: [Din FINN Client ID]
   - `FINN_CLIENT_SECRET`: [Din FINN Client Secret]
5. Deploy tjenesten

### Konfigurer komponenten i Vev

1. I Vev Design Editor, legg til "FINN Annonser"-komponenten
2. I "Proxy URL"-feltet, legg inn din Render-URL (f.eks. `https://finn-vev-proxy.onrender.com`)
3. Legg inn en FINN søke-URL i "FINN søke-URL"-feltet

### Alternativ: Bruk uten proxy

Hvis du ikke setter opp en proxy, vil komponenten falle tilbake til FINNs offentlige API, som har noen begrensninger men fungerer direkte fra nettleseren.

## Utvikling

```bash
# Installer Vev CLI
npm install -g @vev/cli

# Logg inn
vev login

# Start utvikling
vev start

# Deploy til Vev
vev deploy
```

## API Endepunkt

Proxy-endepunktet er tilgjengelig på: `/api/finn-search`

Forespørsel (POST):
```json
{
  "vertical": "bap",
  "filters": {
    "q": "sykkel",
    "location": "Oslo"
  },
  "size": 10,
  "sort": "PUBLISHED_DESC"
}
```