<?php

namespace WeDevs\WeMail\Admin;

use WeDevs\WeMail\Admin\Menu;
use WeDevs\WeMail\Admin\Scripts;
use WeDevs\WeMail\Traits\Hooker;

class Admin {

    use Hooker;

    public function __construct() {
        // $this->add_action( 'admin_init', 'remove_admin_notice' );

        $this->includes();
    }

    private function includes() {
        new Scripts();
        new Menu();
        new FormPreview();

        if ( current_user_can( 'edit_posts' ) && wemail_validate_boolean( get_user_option('rich_editing') ) ) {
            new Shortcode();
        }
    }

    public function remove_admin_notice() {
        remove_all_actions( 'admin_notices' );
    }

}
