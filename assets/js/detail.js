// Change main image on thumbnail click
      function changeImage(src) {
        document.getElementById("mainImage").src = src;

        // Update border on thumbnails
        const thumbnails = document.querySelectorAll(
          'img[onclick^="changeImage"]'
        );
        thumbnails.forEach((thumb) => {
          if (thumb.src === src) {
            thumb.classList.add("border-primary");
            thumb.classList.remove("border-transparent");
          } else {
            thumb.classList.remove("border-primary");
            thumb.classList.add("border-transparent");
          }
        });
      }

      // Add to cart function
      function addToCart() {
        const stock = document.getElementById("stock");
        const currentStock = parseInt(stock.textContent);

        if (currentStock > 0) {
          stock.textContent = currentStock - 1;
          showToast();
        } else {
          alert("Maaf, stok habis!");
        }
      }

      // Show notification toast
      function showToast() {
        const toast = document.getElementById("toast");
        toast.classList.remove("translate-y-32", "opacity-0");
        toast.classList.add("translate-y-0", "opacity-100");

        setTimeout(() => {
          toast.classList.add("translate-y-32", "opacity-0");
          toast.classList.remove("translate-y-0", "opacity-100");
        }, 3000);
      }

      // Chat seller function
      function chatSeller() {
        alert(
          "Membuka chat dengan Nadia Jastip Bangkok...\n\nFitur chat akan segera tersedia!"
        );
      }

      // Scroll products function
      function scrollProducts(direction) {
        const container = document.getElementById("productsContainer");
        const scrollAmount = 400;

        if (direction === "left") {
          container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }

      // Smooth scroll for navigation
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute("href"));
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });

      // Add animation on scroll
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      }, observerOptions);

      // Observe product cards
      document.querySelectorAll(".bg-white.rounded-xl").forEach((card) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "opacity 0.5s, transform 0.5s";
        observer.observe(card);
      });