import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ConversationMessage {
  role: string; // 'user' or 'response'
  text: string; // The message text
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']  // Ensure this points to the correct SASS file
})
export class AppComponent implements OnInit {
  title = 'chatBot';
  userInput: string = '';
  loading: boolean = false;
  conversation: ConversationMessage[] = []; // Holds the conversation history

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Add the welcome message to the conversation when the component initializes
    this.conversation = [
      {
        role: 'response',
        text: 'Welcome to One-Stop Bot! 👋\n\n' 
             
      }
    ];
  }

  onSubmit(): void {
    if (!this.userInput.trim()) {
      return; // Do nothing if input is empty
    }

    // Add user input to the conversation
    this.conversation.push({ role: 'user', text: this.userInput });
    this.loading = true;

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY';

    const payload = {
      contents: [
        {
          parts: [
            {
              text: this.userInput
            }
          ]
        }
      ]
    };

    // Make the API call
    this.http.post<any>(apiUrl, payload).subscribe(
      (response) => {
        this.loading = false;

        // Check if the API returned a valid response
        if (response.candidates && response.candidates.length > 0) {
          const responseText = response.candidates[0].content.parts[0].text;

          // Add the API response to the conversation
          this.conversation.push({ role: 'response', text: responseText });
        } else {
          // Handle case where no valid response is returned
          this.conversation.push({ role: 'response', text: 'No response from the API.' });
        }

        this.userInput = ''; // Clear the input field after submission
      },
      (error) => {
        this.loading = false;

        // Handle API errors
        this.conversation.push({ role: 'response', text: 'Error occurred. Please try again.' });
        console.error('Error:', error);
      }
    );
  }
}
