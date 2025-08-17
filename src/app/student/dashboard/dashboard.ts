import { RouterLink } from '@angular/router';
import { Student } from './../student';
import { Component } from '@angular/core';

@Component({
  selector: 'app-student-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
