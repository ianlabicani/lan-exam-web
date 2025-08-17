import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-student',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student {}
