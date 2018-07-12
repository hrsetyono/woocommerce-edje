<?php namespace h;

class Frontend_Register {
  private $fields;

  function __construct() {
    add_action( 'woocommerce_register_form_start', array($this, 'add_extra_register_fields') );
    add_action( 'woocommerce_register_post', array($this, 'validate_extra_register_fields'), 10, 3 );
    add_action( 'woocommerce_created_customer', array($this, 'save_extra_register_fields' ) );

    $this->fields = $this->_set_fields();
  }

  /*
    @action woocommerce_register_form_start
  */
  function add_extra_register_fields() {
    foreach( $this->fields as $name => $field ) {
      woocommerce_form_field( $name, $field );
    }
  }

  /*
    @action woocommerce_register_post
  */
  function validate_extra_register_fields( $username, $email, $validation_errors ) {
    foreach( $this->fields as $name => $field ) {

      $required_isset = isset( $field['required'] );
      // if required arg doesn't exist OR exist but false
      if( !$required_isset || ( $required_isset && !$field['required'] ) ) {
        continue;
      }

      // if field not empty
      if( isset( $_POST[ $name ] ) && empty( $_POST[ $name ] ) ) {
        $validation_errors->add(
          $name . '_error',
          printf( __('%l is required ', 'h'), $field['label'] )
        );
      }
    }

    return $validation_errors;
  }


  /*
    @woocommerce_created_customer
  */
  function save_extra_register_fields( $user_id ) {
    foreach( $this->fields as $name => $field ) {
      if( !isset( $_POST[ $name ] ) ) { continue; }

      $value = sanitize_text_field( $_POST[ $name ] );
      update_user_meta( $user_id, $name, $value );

      switch( $name ) {
        case 'billing_first_name':
          update_user_meta( $user_id, 'first_name', $value );
          break;

        case 'billing_last_name':
          update_user_meta( $user_id, 'last_name', $value );
          break;
      }
    }
  }

  /////

  function _set_fields() {
    global $woocommerce;
    $wc_countries = new \WC_Countries();
    $countries = $wc_countries->get_shipping_countries();

    // TODO: need to make ajax to change state when country is changed
    reset( $countries );
    $states = $wc_countries->get_states( key( $countries ) );

    $fields = array(
      'billing_first_name' => array(
        'type' => 'text',
        'label' => __('First name', 'h'),
        'required' => true,
        'placeholder' => __('First name', 'h'),
      ),
      'billing_last_name' => array(
        'type' => 'text',
        'label' => __('Last name', 'h'),
        'required' => true,
        'placeholder' => __('Last name', 'h'),
      ),
      //
      'billing_address_1' => array(
        'type' => 'text',
        'label' => __('Address', 'h'),
        'required' => true,
        'placeholder' => __('Street Address', 'h'),
      ),
      'billing_address_2' => array(
        'type' => 'text',
        'label' => __('Address 2', 'h'),
        'placeholder' => __('Apartment, Suite (optional)', 'h'),
      ),
      //
      'billing_country' => array(
        'type' => 'select',
        'label' => __('Country', 'h'),
        'required' => true,
        'options' => $countries,
      ),
      'billing_state' => array(
        'type' => 'select',
        'label' => __('Province / State', 'h'),
        'required' => true,
        'options' => $states
      ),
      'billing_postcode' => array(
        'type' => 'text',
        'label' => __('Postcode', 'h'),
        'required' => true,
        'placeholder' => __('Postcode', 'h'),
      ),
      //
      'billing_city' => array(
        'type' => 'text',
        'label' => __('Town / City', 'h'),
        'required' => true,
        'placeholder' => __('Town / City', 'h'),
      ),
      'billing_phone' => array(
        'type' => 'text',
        'label' => __('Phone', 'h'),
      ),
      'separator' => array(),
    );

    // prepopulate fields
    foreach( $fields as $name => $f ) {
      if( isset( $_POST[ $name ] ) ) {
        $fields[ $name ]['default'] = $_POST[ $name ];
      }
    }

    return $fields;
  }

}
