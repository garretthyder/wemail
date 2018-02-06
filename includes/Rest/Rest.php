<?php

namespace WeDevs\WeMail\Rest;

use WeDevs\WeMail\Rest\Countries;
use WeDevs\WeMail\Rest\Csv;
use WeDevs\WeMail\Rest\Customizer;
use WeDevs\WeMail\Rest\MailPoet;
use WeDevs\WeMail\Rest\States;
use WeDevs\WeMail\Traits\Hooker;

class Rest {

    use Hooker;

    public function __construct() {
        $this->add_action( 'rest_api_init', 'register_controllers' );
    }

    public function register_controllers() {
        new Countries();
        new States();
        new Customizer();
        new Auth();
        new MailPoet();
        new Csv();
    }

}