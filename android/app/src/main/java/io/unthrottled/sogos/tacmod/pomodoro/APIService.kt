package io.unthrottled.sogos.tacmod.pomodoro

import android.content.Context
import io.unthrottled.sogos.tacmod.R
import okhttp3.*
import java.io.BufferedReader
import java.io.IOException
import java.security.KeyStore
import java.security.SecureRandom
import javax.net.ssl.*

object APIService {
  private lateinit var client: OkHttpClient

  fun initialize(context: Context) {
    val (ssl, trust) = createFactory(context)
    client = OkHttpClient.Builder()
      .sslSocketFactory(ssl, trust)
      .build()

  }

  private fun createFactory(context: Context): Pair<SSLSocketFactory, X509TrustManager> {
    val sslContext: SSLContext = SSLContext.getInstance("SSL")
    val trustManagerFactory: TrustManagerFactory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm())
    val readKeyStore = readKeyStore(context)
    trustManagerFactory.init(readKeyStore)
    val keyManagerFactory: KeyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm())
    keyManagerFactory.init(readKeyStore, "changeit".toCharArray())
    sslContext.init(keyManagerFactory.getKeyManagers(), trustManagerFactory.trustManagers, SecureRandom())
    return sslContext.socketFactory to trustManagerFactory.trustManagers.first() as X509TrustManager
  }


  private fun readKeyStore(context: Context): KeyStore? {
    val ks = KeyStore.getInstance("pkcs12")
    return context.getResources().openRawResource(R.raw.custom).use {
      ks.load(it, "changeit".toCharArray())
      ks
    }
  }

  fun performRequest(
      request: Request,
      callbutt: (response: String) -> Unit,
      error: (e: Throwable) -> Unit
  ) {
    client.newCall(request).enqueue(object : Callback {
      override fun onFailure(call: Call, e: IOException) {
        error(e)
      }

      override fun onResponse(call: Call, response: Response) {
        response.use { res ->
          if (res.isSuccessful) {
            res.body()?.charStream()?.use {
              try {
                val reader = BufferedReader(it)
                val stringBuilder = StringBuilder()
                var line: String? = reader.readLine()
                while (line != null) {
                  stringBuilder.append(line)
                  line = reader.readLine()
                }
                callbutt(stringBuilder.toString())
              } catch (e: Throwable) {
                error(e)
              }
            }
          } else {
            error(
                RuntimeException(
                    "Shit did not work, returned ${res.code()}"
                )
            )
          }
        }
      }
    })
  }
}