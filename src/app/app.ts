import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BannerSinConexion } from './components/secundarios/banner-sin-conexion/banner-sin-conexion';
import { ToastContenedor } from './components/secundarios/toast-contenedor/toast-contenedor';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BannerSinConexion, ToastContenedor],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
