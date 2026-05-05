import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ChatMessage } from '../../../core/services/analysis.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  host: {
    style: 'display: flex; flex-direction: column; height: 100%;'
  }
})
export class ChatComponent {
  // Inputs
  chatMessages = input<ChatMessage[]>([]);
  isTyping = input<boolean>(false);
  chatError = input<string | null>(null);

  // Local state for input
  chatInput = signal<string>('');

  // Outputs
  sendMessage = output<string>();

  /**
   * Send chat message
   */
  sendChatMessage(): void {
    const message = this.chatInput().trim();
    if (!message) return;

    this.sendMessage.emit(message);
    this.chatInput.set('');
  }

  /**
   * Handle Enter key in chat input
   */
  onChatInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendChatMessage();
    }
  }
}
