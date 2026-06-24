# Zbiórka - proste demo

Pliki w projekcie:

- [index.html](index.html) — główna strona
- [style.css](style.css) — style
- [script.js](script.js) — logika i localStorage

Jak uruchomić:

1. Uruchom serwer, aby synchronizować dane między urządzeniami (wymaga Node.js):

```bash
cd "c:\Users\chaci\Downloads\pierniadze zebrane"
npm install
npm start
```

Po uruchomieniu otwórz w przeglądarce: `http://localhost:3000`.
2. Wybierz cel na górze (Kuba lub Adrian).
3. Kliknij jeden z przycisków pod paskiem (+/-) — suma zostanie zapisana na serwerze i będzie widoczna na innych urządzeniach podłączonych do tego samego serwera. Jeśli serwer jest niedostępny, zmiany zostaną zapisane lokalnie.
4. W panelu administratora wpisz imię i kliknij "Zapisz profil" — także zapisze się w localStorage.
5. Aby edytować saldo konkretnego celu, musisz się zalogować jako ten cel (Kuba lub Adrian). Zaloguj się używając domyślnych haseł (poniżej).


Domyślne hasła demo (zaktualizowane):

- Kuba: `13`
- Adrian: `67`

Uwaga: to proste demo — hasła są przechowywane w kodzie klienta. Jeśli chcesz, mogę dodać możliwość zmiany haseł i bezpieczne przechowywanie po stronie serwera.

Trwałe przechowywanie:

Wszystkie dane są przechowywane lokalnie w przeglądarce w kluczu `funds_app_v1`. Jeśli chcesz synchronizować na serwerze, mogę pomóc dodać prosty backend.
