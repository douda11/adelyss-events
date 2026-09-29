package com.adelyss.events.config;

import com.adelyss.events.model.ServiceOffer;
import com.adelyss.events.repository.ServiceOfferRepository;
import javax.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class ServiceOfferBootstrap {

  private final ServiceOfferRepository serviceOfferRepository;

  public ServiceOfferBootstrap(ServiceOfferRepository serviceOfferRepository) {
    this.serviceOfferRepository = serviceOfferRepository;
  }

  @PostConstruct
  public void seedDefaultServices() {
    if (serviceOfferRepository.count() > 0) {
      return;
    }

    serviceOfferRepository.save(new ServiceOffer(
        "Événements professionnels",
        "Séminaires, conventions, lancements produit et team building sur mesure.",
        "🏢",
        1
    ));

    serviceOfferRepository.save(new ServiceOffer(
        "Événements privés",
        "Mariages, anniversaires et célébrations avec une scénographie soignée.",
        "💍",
        2
    ));

    serviceOfferRepository.save(new ServiceOffer(
        "Nos prestations",
        "Logistique, décoration, coordination jour J et partenaires de confiance.",
        "✨",
        3
    ));
  }
}
