(function($) {
  "use strict";

  var changeDefault = {
    init: function() {
      this.variation();
    },

    variation: function() {
      var that = this;

      // remove default toggle
      $("#variable_product_options").off("click", ".wc-metabox h3");
      $("#variable_product_options").off("click", ".wc-metabox > h3");

      // toggle only if clicking the Edit button
      $("#variable_product_options").on("click", "h3 .handlediv", that.toggleVariation);
    },

    toggleVariation: function() {
      var $container = $(this).closest(".woocommerce_variation");
      $container.toggleClass("open closed");
      $container.find(".wc-metabox-content").slideToggle();
    }
  };

  var variation = {
    priceField: "[name*='variable_regular_price']",
    stockField: "[name*='variable_stock[']",

    init: function() {
      var $variation = $(".woocommerce_variations");
      $variation.on("DOMNodeInserted", this.onAdded.bind(this) );

      $variation.on("focus", "h3 input", this.highlightHeader);
      $variation.on("blur", "h3 input", this.removeHighlightHeader);

      this.addGlobalForm();
      this.addListener();
    },

    highlightHeader: function(e) {
      $(this).closest(".woocommerce_variation").addClass("active");
    },

    removeHighlightHeader: function(e) {
      $(this).closest(".woocommerce_variation").removeClass("active");
    },

    // After loading the variation, add quick form at the header
    onAdded: function(e) {
      var that = this;
      var $target = $(e.target);

      if($target.hasClass("woocommerce_variation") ) {
        var $header = $target.closest(".woocommerce_variation").find("h3");
        var $priceField = $target.find(that.priceField);
        var $stockField = $target.find(that.stockField);

        var data = {
          currency: woocommerce_admin_meta_boxes.currency_format_symbol,
          price: $priceField.val(),
          stock: $stockField.val(),
          isEqualGlobalPrice: $("#global-price").val() == $priceField.val()
        };

        // manage stock always on
        $target.find("[name*='variable_manage_stock']").prop("checked", true).change();

        // append template
        var template = Handlebars.compile($("#h-quick-form").html() );
        var html = template(data);
        $header.append(html);

        // field.link($priceField, $header.find("input[type='text']") );
        // field.link($stockField, $header.find("input[type='number']") );
      }
    },

    // Add global price and sale fields
    addGlobalForm: function() {
      var data = {
        currency: woocommerce_admin_meta_boxes.currency_format_symbol
      };

      var template = Handlebars.compile($("#h-global-form").html() );
      var html = template(data);
      $("#variable_product_options .toolbar-top").after(html);

      // copy the WC regular price field to global field
      $("#global-price").val( $("#_regular_price").val() ).change();
    },

    addListener: function() {
      // initiate global price field listener
      priceField.init();
    }
  };

  /*
    Global Price Field
  */
  var priceField = {
    main: "#global-price",
    targets: ".woocommerce_variation [name*='variable_regular_price']",
    target: "[name*='variable_regular_price']",
    quick: "h3 input[type='text']",

    init: function() {
      $(".woocommerce_variations").on("change", this.target, this.onTargetChange);
      $(".woocommerce_variations").on("change", this.quick, this.onQuickChange);
      $(this.main).on("change", this.onGlobalChange.bind(this) );
    },

    onTargetChange: function(e) {
      var val = $(this).val();
      var that = priceField;

      var $quick = $(this).closest(".woocommerce_variation").find(that.quick);
      $quick.val(val);

      // if same as global value, delete it so it shows the placeholder
      if($(that.main).val() === val) {
        $quick.val("");
      }
    },

    onQuickChange: function(e) {
      var val = $(this).val();
      var that = priceField;

      var $target = $(this).closest(".woocommerce_variation").find(that.target);
      $target.val(val );

      // if same as global value, delete it so it shows the placeholder
      if($(that.main).val() === val) {
        $(this).val("");
      }
    },

    onGlobalChange: function(e) {
      var that = this;
      var globalVal = $(that.main).val();

      // change placeholder on quick field
      var $quicks = $(".woocommerce_variation " + that.quick);
      $quicks.attr("placeholder", globalVal);

      $(that.targets).each(function() {
        var $target = $(this);
        var $quick = $(this).closest(".woocommerce_variation").find(that.quick);

        var isEmpty = !$quick.val();
        var isEqualGlobal = $quick.val() === globalVal;

        // if empty, it follows the placeholder price, so change the target too
        if(isEmpty) { $target.val(globalVal).change() ; }

        // if equal global, remove the quick content
        if(isEqualGlobal) { $quick.val(""); }
      });
    }
  };

  var field = {
    // link two fields, one changed, the other one also changed
    link: function($fieldA, $fieldB) {
      $fieldA.on("change", function(e) {
        $fieldB.val($(this).val() );
      });

      $fieldB.on("change", function(e) {
        $fieldA.val($(this).val() );
      });

      // initially copy the value;
      if($fieldA.val() ) {
        $fieldB.val($fieldA.val() );
      }
    },

    // link between the quick form at the header with the main form
    quickLink: function($fieldMain, $fieldQuick) {
      $fieldMain.on("change", function(e) {
        var val = $(this).val();

        // if same as global price, change the placeholder
        if($("#global-price").val() === val) {
          $fieldQuick.attr("placeholder", val);
        } else {
          $fieldQuick.val(val);
        }
      });
    }
  };

  var start = function() {
    changeDefault.init();
    variation.init();
  };

  $(document).ready(start);
  $(document).on("page:load", start);
})(jQuery);
