// ============================================
// Razorpay Checkout via WebView
// Works with Expo Go — no native module needed
// ============================================

import React from 'react';
import { Modal, View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { RAZORPAY_KEY_ID, RAZORPAY_CURRENCY } from '../utils/constants';
import { COLORS } from '../utils/colors';

interface RazorpayCheckoutProps {
  visible: boolean;
  amount: number; // in rupees (will be converted to paise)
  planName: string;
  userName: string;
  userEmail: string;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
  onDismiss: () => void;
}

export const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  visible,
  amount,
  planName,
  userName,
  userEmail,
  onSuccess,
  onFailure,
  onDismiss,
}) => {
  const amountInPaise = amount * 100;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #1A1A2E;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          color: #fff;
        }
        .loader {
          text-align: center;
          padding: 20px;
        }
        .loader p {
          margin-top: 16px;
          font-size: 16px;
          color: #aaa;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #333;
          border-top-color: #FFD60A;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="loader">
        <div class="spinner"></div>
        <p>Opening Razorpay...</p>
      </div>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <script>
        var options = {
          key: '${RAZORPAY_KEY_ID}',
          amount: ${amountInPaise},
          currency: '${RAZORPAY_CURRENCY}',
          name: 'Nexu Fitness',
          description: '${planName} Plan Subscription',
          prefill: {
            name: '${userName}',
            email: '${userEmail}',
          },
          theme: {
            color: '#FFD60A',
            backdrop_color: '#1A1A2E',
          },
          handler: function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_SUCCESS',
              paymentId: response.razorpay_payment_id,
            }));
          },
          modal: {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_DISMISSED',
              }));
            },
            escape: true,
            confirm_close: true,
          },
        };

        try {
          var rzp = new Razorpay(options);
          rzp.on('payment.failed', function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_FAILED',
              error: response.error.description || 'Payment failed',
              code: response.error.code,
            }));
          });
          rzp.open();
        } catch(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_ERROR',
            error: e.message || 'Failed to initialize Razorpay',
          }));
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'PAYMENT_SUCCESS':
          onSuccess(data.paymentId);
          break;
        case 'PAYMENT_FAILED':
          onFailure(data.error || 'Payment failed');
          break;
        case 'PAYMENT_DISMISSED':
          onDismiss();
          break;
        case 'PAYMENT_ERROR':
          onFailure(data.error || 'Payment initialization failed');
          break;
      }
    } catch {
      // Ignore non-JSON messages
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={modalStyles.container}>
        {/* Header with close button */}
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onDismiss} style={modalStyles.closeBtn}>
            <Feather name="x" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle}>Complete Payment</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* WebView */}
        <WebView
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={modalStyles.loading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={modalStyles.loadingText}>Loading payment gateway...</Text>
            </View>
          )}
          style={{ flex: 1, backgroundColor: '#1A1A2E' }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A4E',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#2A2A4E',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Kanit_600SemiBold',
    color: '#fff',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#aaa',
  },
});
