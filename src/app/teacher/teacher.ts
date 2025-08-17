import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-teacher',
  imports: [RouterOutlet, Navbar],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css',
})
export class Teacher {}
