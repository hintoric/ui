---
'@hintoric/email': minor
---

New `CompanyDataFoundEmail` / `renderCompanyDataFound`: tells someone that their company details were found on the website behind their mail domain and invites them to review them. A heading ("Deine Firmendaten sind schon da"), an icon, one sentence ("Die Angaben zu Muster Bau GmbH wurden automatisch auf muster-bau.de gefunden. Du musst nichts abtippen, nur prüfen."), a button to the prefilled company settings page, and the note that nothing is taken over before they confirm. The individual fields are not listed. `companyName` is optional — without it the texts speak of "your company". German and English messages (`companyDataFoundMessagesDe` / `…En`).
