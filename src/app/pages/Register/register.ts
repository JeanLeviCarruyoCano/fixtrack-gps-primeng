import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { selectorIdiomas } from '../../components/SelectorIdiomas/selectorIdiomas';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    selectorIdiomas,
    ButtonModule,
    InputTextModule,
    ToastModule,
  ],
  providers: [MessageService],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  mask = false;
  mask1 = false;
  nombreUsuario = '';
  email = '';
  contrasena = '';
  confirmarContrasena = '';

  constructor(private readonly messageService: MessageService) {}

  validarRegistro(): void {
    if (
      !this.nombreUsuario ||
      !this.email ||
      !this.contrasena ||
      !this.confirmarContrasena
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos',
      });
      return;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Las contraseñas no coinciden',
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Registro exitoso',
    });
  }
}
