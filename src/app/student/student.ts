import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';

@Component({
  selector: 'app-student',
  imports: [RouterOutlet, Navbar],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student {}
