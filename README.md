# Zbiórka - proste demo

Pliki w projekcie:

- [index.html](index.html) — główna strona
- [style.css](style.css) — style
- [script.js](script.js) — logika i localStorage

Jak uruchomić:

1. Otwórz plik `index.html` w przeglądarce (dwuklik lub "Otwórz z... -> Przeglądarka").
2. Wybierz cel na górze (Kuba lub Adrian).
3. Kliknij jeden z przycisków pod paskiem (+50, +100, +200, +500, +1000) — suma zostanie zapisana w `localStorage`.
4. W panelu administratora wpisz imię i kliknij "Zapisz profil" — także zapisze się w localStorage.
5. Aby edytować saldo konkretnego celu, musisz się zalogować jako ten cel (Kuba lub Adrian).


Domyślne hasła demo (zaktualizowane):

- Kuba: `13`
- Adrian: `67`

Uwaga: to proste demo — hasła są przechowywane w kodzie klienta. Jeśli chcesz, mogę dodać możliwość zmiany haseł i bezpieczne przechowywanie po stronie serwera.

Trwałe przechowywanie:

Wszystkie dane są przechowywane lokalnie w przeglądarce w kluczu `funds_app_v1`. Jeśli chcesz synchronizować na serwerze, mogę pomóc dodać prosty backend.
