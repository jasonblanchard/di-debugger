import { connect, Payload } from 'ts-nats';
import { messages } from './messages';

interface RequestMappings {
  [key: string]: any;
}

const requestMappings: RequestMappings = {
  'get.entry': messages.entry.GetEntryRequest,
  'create.entry': messages.entry.CreateEntryRequest,
}

interface ResponseMappings {
  [key: string]: any;
}

const responseMappings: ResponseMappings = {
  'get.entry': messages.entry.GetEntryResponse,
  'create.entry': messages.entry.CreateEntryResponse,
};

interface ReplyMappings {
  [key: string]: any;
}

const replyMappings: ReplyMappings = {};

async function bootstrap() {
  let nc = await connect({
    servers: ['nats://localhost:4222'],
    payload: Payload.BINARY
  });

  await nc.subscribe('*.>', (error, message) => {
    const dataMapper = requestMappings[message.subject] || replyMappings[message.subject];
    const data = dataMapper ? dataMapper.decode(message.data) : message.data;
    if (message.reply) {
      const replyMapper = responseMappings[message.subject];
      replyMappings[message.reply] = replyMapper;
    }
    console.log({ ...message, data });
    delete replyMappings[message.subject];
  });
}

bootstrap().then(() => console.log('Debugger Bootstrapped 🚀'));
