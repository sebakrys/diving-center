package pl.sebakrys.diving;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import pl.sebakrys.diving.config.EnvironmentVariablesInitializer;


@SpringBootApplication
public class DivingApplication {



	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(DivingApplication.class);
		app.addInitializers(new EnvironmentVariablesInitializer());
		app.run(args);
	}

}
