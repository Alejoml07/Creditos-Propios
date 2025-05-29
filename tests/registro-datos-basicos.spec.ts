import { test, expect } from '@playwright/test';

test('Formulario de registro - Datos Básicos', async ({ page }) => {
  // Navegar a la página de registro
  await page.goto('http://localhost:4200/registro/datos-basicos');

  // Llenar campos del formulario
  await page.getByRole('textbox', { name: 'Número de documento*' }).fill('42686605');
  await page.getByRole('textbox', { name: 'Celular*' }).fill('3137223904');
  await page.getByRole('textbox', { name: 'Primer Apellido*' }).fill('Lezcano');
  await page.getByRole('textbox', { name: 'Fecha de expedición del' }).fill('1991-07-10');
  await page.getByRole('textbox', { name: 'Correo Electrónico*' }).fill('alejandromunozlezcano@gmail.com');

  // Marcar checkbox de autorización
  await page.getByRole('checkbox', { name: 'Documento de prueba Documento' }).check();

  // Enviar el formulario
  await page.getByRole('button', { name: 'Continuar' }).click();


});