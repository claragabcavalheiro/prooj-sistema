// singleton que garante config unica e global, sem precisar passar por parametro 
class ConfiguracaoSistema {
  private static instanciaUnica: ConfiguracaoSistema; // guarda a unica instancia da classe configsistema

  nomeSistema: string = "SistemaNotificacoes";
  servidorEmail: string = "mail.local";
  maxTentativas: number = 2;
  
  private constructor() {} // nao pode criar fora da classe 

  static obterInstancia(): ConfiguracaoSistema {
    if (!ConfiguracaoSistema.instanciaUnica) {
      ConfiguracaoSistema.instanciaUnica = new ConfiguracaoSistema(); // cria a unica instancia se nao tiver sido criada 
    }
    return ConfiguracaoSistema.instanciaUnica; // sempre a mesma
  }
}

// interface comum para notificações
interface Notificacao {
  enviar(): void;
}

// template method: define o fluxo de envio mas deixa o detalhe para subclasses
abstract class NotificacaoBase implements Notificacao {
  enviar(): void {
    const config = ConfiguracaoSistema.obterInstancia(); // pega config unica

    for (let i = 0; i < config.maxTentativas; i++) {
      const sucesso = this.tentarEnvio();
      if (sucesso) return;
    }

    console.log("envio não realizado");
  }

  protected abstract tentarEnvio(): boolean;
}

// implementação concreta de email
class EmailNotificacao extends NotificacaoBase {
  protected tentarEnvio(): boolean {
    const config = ConfiguracaoSistema.obterInstancia(); // mesma config para tudo 
    console.log(`email via ${config.servidorEmail}`);
    return true;
  }
}

// implementação concreta de sms
class SMSNotificacao extends NotificacaoBase {
  protected tentarEnvio(): boolean {
    console.log("sms enviado");
    return true;
  }
}

// implementação concreta de push
class PushNotificacao extends NotificacaoBase {
  protected tentarEnvio(): boolean {
    console.log("push enviado");
    return true;
  }
}

// api externa de sms (não compatível)
class SmsApiExterna {
  sendMessage(numero: string, texto: string): boolean {
    console.log(`sms externo enviado para ${numero}: ${texto}`);
    return true;
  }
}

// adapter: traduz a api externa para o padrão interno
class SmsAdapter extends NotificacaoBase {
  private api: SmsApiExterna;

  constructor(api: SmsApiExterna) {
    super();
    this.api = api;
  }

  protected tentarEnvio(): boolean {
    return this.api.sendMessage("9999-9999", "mensagem via adapter");
  }
}

// proxy: adiciona validação e logs sem mexer na classe original
class NotificacaoProxy implements Notificacao {
  private real: Notificacao;

  constructor(real: Notificacao) {
    this.real = real;
  }

  enviar(): void {
    console.log("proxy: validando permissões...");
    console.log("proxy: registrando log de envio...");
    this.real.enviar();
  }
}

// factory: cria objetos sem if ou switch
class FabricaNotificacao {
  private static mapa = new Map<string, any>([
    ["email", EmailNotificacao],
    ["sms", SMSNotificacao],
    ["push", PushNotificacao]
  ]);

  static criar(tipo: string): Notificacao {
    const Classe = this.mapa.get(tipo); // acha a classe

    if (!Classe) {
      throw new Error("tipo invalido");
    }

    return new Classe(); // cria aqui (factory)
  }
}

// serviço principal
class ServicoNotificacao {
  iniciar() {
    const config = ConfiguracaoSistema.obterInstancia(); // mesma config pra tudo
    console.log(`sistema: ${config.nomeSistema}`);

    const tipos = ["email", "sms", "push"];

    tipos.forEach(tipo => {
      const notificacao = FabricaNotificacao.criar(tipo); 
      const proxy = new NotificacaoProxy(notificacao); // aplica proxy
      proxy.enviar();
    });

    // exemplo usando adapter + proxy
    const smsAdapter = new SmsAdapter(new SmsApiExterna());
    const proxyAdapter = new NotificacaoProxy(smsAdapter);
    proxyAdapter.enviar();
  }
}

// main
new ServicoNotificacao().iniciar();
