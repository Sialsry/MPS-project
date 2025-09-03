import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { MeService } from './me.service';
import { CreateMeDto } from './dto/create-me.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@WebSocketGateway()
export class MeGateway {
  constructor(private readonly meService: MeService) {}

  @SubscribeMessage('createMe')
  create(@MessageBody() createMeDto: CreateMeDto) {
    return this.meService.create(createMeDto);
  }

  @SubscribeMessage('findAllMe')
  findAll() {
    return this.meService.findAll();
  }

  @SubscribeMessage('findOneMe')
  findOne(@MessageBody() id: number) {
    return this.meService.findOne(id);
  }

  @SubscribeMessage('updateMe')
  update(@MessageBody() updateMeDto: UpdateMeDto) {
    return this.meService.update(updateMeDto.id, updateMeDto);
  }

  @SubscribeMessage('removeMe')
  remove(@MessageBody() id: number) {
    return this.meService.remove(id);
  }
}
