import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  // 🔑 Remplace par ta propre clé API ici
  private apiKey = 'TA_CLE_API_ICI';

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`
  });

  private isWaiting = false; // Pour éviter les requêtes trop rapides

  constructor(private http: HttpClient) {}

  getChatbotResponse(message: string): Observable<string> {
    if (this.isWaiting) {
      return of("⏳ Patiente quelques secondes avant d’envoyer une autre question.");
    }

    this.isWaiting = true;

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    };

    return this.http.post<any>(this.apiUrl, body, { headers: this.headers }).pipe(
      map(res => res.choices[0]?.message?.content ?? "🤖 Je n’ai pas compris."),
      tap(() => {
        // Autorise une nouvelle requête après 3 secondes
        setTimeout(() => {
          this.isWaiting = false;
        }, 3000);
      }),
      catchError(err => {
        this.isWaiting = false;

        if (err.status === 429) {
          return of("🚫 Trop de requêtes. Attends un peu avant d’essayer à nouveau.");
        }

        return of("❌ Une erreur est survenue avec l'IA.");
      })
    );
  }
}
