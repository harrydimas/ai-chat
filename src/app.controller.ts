import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('chat')
  async sendChatMessage(@Body() body: any, @Req() req, @Res() res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush headers to start sending

    const message = body.message;
    const stream$ = await this.appService.sendChatMessage(message);

    const subscription = stream$.subscribe({
      next: (text: string) => {
        res.write(`data: ${text}\n\n`);
      },
      error: (err) => {
        console.error(err);
        res.write(`event: error\ndata: ${JSON.stringify(err)}\n\n`);
        res.end();
      },
      complete: () => {
        res.end(); // close the stream
      }
    });

    // Clean up when client disconnects
    req.on('close', () => {
      subscription.unsubscribe();
      res.end();
    });
  }
}
