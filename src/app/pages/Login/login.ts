import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { selectorIdiomas } from '../../components/SelectorIdiomas/selectorIdiomas';

@Component({
  standalone: true,
  imports: [
    selectorIdiomas,
    ButtonModule,
    FormsModule,
    InputTextModule,
    RouterLink,
    ToastModule,
  ],
  providers: [MessageService],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  constructor(
    private readonly messageService: MessageService,
    private readonly router: Router,
  ) {}

  nombreUsuario = '';
  contrasena = '';
  mask = false;

  validarInicio(): void {
    if (!this.nombreUsuario || !this.contrasena) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos',
      });
      return;
    }

    if (this.nombreUsuario === 'admin' && this.contrasena === '123') {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Inicio de sesión exitoso',
      });
      this.router.navigate(['/home']);
      return;
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Usuario o contraseña incorrectos',
    });
  }
}
