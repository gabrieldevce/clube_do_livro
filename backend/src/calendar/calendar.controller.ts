import { Controller, Get, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async getCalendar(@Query('start') start?: string, @Query('end') end?: string) {
    return this.calendarService.getEvents(start, end);
  }
}
