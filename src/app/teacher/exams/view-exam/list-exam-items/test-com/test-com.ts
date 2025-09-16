import { Component, input } from '@angular/core';

@Component({
  selector: 'app-test-com',
  imports: [],
  templateUrl: './test-com.html',
  styleUrl: './test-com.css',
})
export class TestCom {
  level = input.required<'easy' | 'moderate' | 'difficult'>();

  myVal() {
    console.log(this.level());
  }
}
