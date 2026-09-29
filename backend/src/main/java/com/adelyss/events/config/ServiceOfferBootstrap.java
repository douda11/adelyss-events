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
        "Evenements professionnels",
        "Seminaires, conventions, lancements produit et team building sur mesure.",
        "\uD83C\uDFE2",
        1
    ));

    serviceOfferRepository.save(new ServiceOffer(
        "Evenements prives",
        "Mariages, anniversaires et celebrations avec une scenographie soignee.",
        "\uD83D\uDC8D",
        2
    ));

    serviceOfferRepository.save(new ServiceOffer(
        "Nos prestations",
        "Logistique, decoration, coordination jour J et partenaires de confiance.",
        "\u2728",
        3
    ));
  }
}
