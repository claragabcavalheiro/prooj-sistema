class ConfiguracaoSistema {
  private static instanciaUnica: ConfiguracaoSistema; // guarda a unica instancia

  nomeSistema: string = "SistemaNotificacoes";
  servidorEmail: string = "mail.local";
  maxTentativas: number = 2;

  private constructor() {} // nao deixa criar fora

  static obterInstancia(): ConfiguracaoSistema {
    if (!ConfiguracaoSistema.instanciaUnica) {
      ConfiguracaoSistema.instanciaUnica = new ConfiguracaoSistema(); // cria uma vez
    }
    return ConfiguracaoSistema.instanciaUnica; // sempre a mesma
  }
}

interface Notificacao {
  enviar(): void;
}

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

class EmailNotificacao extends NotificacaoBase {
  protected tentarEnvio(): boolean {
    const config = ConfiguracaoSistema.obterInstancia(); // usa config global
    console.log(`email via ${config.servidorEmail}`);
    return true;
  }
}

class SMSNotificacao extends NotificacaoBase {
  protected tentarEnvio(): boolean {
    console.log("sms enviado");
    return true;
  }
}

class PushNotificacao extends NotificacaoBase {
  protected tentarEnvio(): boolean {
    console.log("push enviado");
    return true;
  }
}

class FabricaNotificacao {
  // liga o tipo com a classe
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

class ServicoNotificacao {
  iniciar() {
    const config = ConfiguracaoSistema.obterInstancia(); // mesma config pra tudo

    console.log(`sistema: ${config.nomeSistema}`);

    const tipos = ["email", "sms", "push"];

    tipos.forEach(tipo => {
      const notificacao = FabricaNotificacao.criar(tipo); // cria pelo tipo
      notificacao.enviar();
    });
  }
}

new ServicoNotificacao().iniciar();